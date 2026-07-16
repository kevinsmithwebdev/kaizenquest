import { Kafka, type Producer } from "kafkajs";

let producer: Producer | null = null;
let connecting: Promise<Producer | null> | null = null;

const getBrokers = (): string[] => {
  const raw = process.env.KAFKA_BROKERS ?? "localhost:9092";
  return raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
};

export async function getKafkaProducer(): Promise<Producer | null> {
  if (producer) {
    return producer;
  }

  if (connecting) {
    return connecting;
  }

  connecting = (async () => {
    try {
      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID ?? "kaizen",
        brokers: getBrokers(),
      });
      const next = kafka.producer();
      await next.connect();
      producer = next;
      return producer;
    } catch (error) {
      console.warn("[kafka] producer unavailable:", error);
      return null;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
}

export async function publishKafkaMessage(
  topic: string,
  message: unknown,
): Promise<void> {
  const active = await getKafkaProducer();
  if (!active) {
    console.warn(`[kafka] skipped publish to ${topic} (no producer)`);
    return;
  }

  await active.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}
