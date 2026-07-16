# Redpanda (Kafka-compatible) for Railway

# Create an Empty service, set Docker image to: docker.redpanda.com/redpandadata/redpanda:v24.3.1

# Custom start command below (or paste into Railway Start Command).

# Start command:

# redpanda start --overprovisioned --smp 1 --memory 512M --reserve-memory 0M --node-id 0 --check=false --kafka-addr internal://0.0.0.0:9092 --advertise-kafka-addr internal://kafka.railway.internal:9092 --pandaproxy-addr 0.0.0.0:8082 --schema-registry-addr 0.0.0.0:8081

# Private networking: enable Railway private networking; set service name to `kafka`

# so other services can use KAFKA_BROKERS=kafka.railway.internal:9092
