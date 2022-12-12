/** Our application needs to talk to teh technology which in this case is Redis.
 *  We don't hardcode any configuration. Instead, we use a Generic Container Instance
 *  to provide information where it is running so that we can configure our app properly */

const Redis = require("ioredis");   // In this example, ioredis is the docker image name
const {GenericContainer} = require("testcontainers");

describe("GenericContainer Test", () => {
    let container;
    let redisClient;

    // Utilising hook to create the container before all tests
    beforeAll(async () => {
        /** The framework's basic building block is generic container which is an
            abstraction that represents the container to be managed via Testcontainers */
        container = await new GenericContainer("redis")
            /** How to copy a file to a container before it is started e.g. instantiate
             your db schema by sending it into your container */
            // .withCopyContentToContainer(
            //     "hello world",
            //     "/remote/file2.txt")
            .withExposedPorts(6379)
            .start();   // Lifecycle management

        redisClient = new Redis(
            container.getMappedPort(6379),
            container.getHost(),
        );
    });

    // Always clean-up after the container runs
    afterAll(async () => {
        await redisClient.quit();
        await container.stop();     // Lifecycle management
        await container.close()     // Lifecycle management
    });

    it("Test to set and retrieve values from Redis", async () => {
        await redisClient.set("key", "val");
        expect(await redisClient.get("key")).toBe("val");
    });
});