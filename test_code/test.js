/** Our application needs to talk to the technology which in this case is Redis.
 *  We don't hardcode any configuration. Instead, we use a Generic Container Instance
 *  to provide information where it is running so that we can configure our app properly */

const Redis = require("ioredis");   // In this example, ioredis is the docker image name
const {GenericContainer} = require("testcontainers");

describe("Leverage Redis Testcontainer", () => {
    let container
    let redisClient

    // Utilising hook to create the container before all tests
    beforeAll(async () => {
        /** The framework's basic building block is generic container which is an
            abstraction that represents the container to be managed via Testcontainers
             -> What is happening under the hood:
                 - It configures the Docker SDK
                 - Pushes the request to the Docker API
                 - When the container is ready we get back the Redis container
                   with a bunch of utilities and APIs that are designed to run
                   inside a test
         */
        container = await new GenericContainer("redis")
            /** How to copy a file to a container before it is started e.g. instantiate
             your db schema by sending it into your container */
            // .withCopyContentToContainer(
            //     "hello world",
            //     "/remote/file2.txt")
            .withExposedPorts(6379)     // Redis exposes port 6379 so we need to open it
            .start();                         // Lifecycle management -> We can start it now or later on if required

        redisClient = new Redis(
            container.getMappedPort(6379),
            container.getHost(),
        );
    });

    // Always clean-up after the container runs
    afterAll(async () => {
        await redisClient.quit()
        await container.stop()      // Lifecycle management
        await container.close()     // Lifecycle management
    });

    it("Test to set and retrieve values from Redis", async () => {
        const resp = await redisClient.ping()   // Command PING checks whether the server is running or not
        console.log(resp)
        await redisClient.set("key", "val")
        expect(await redisClient.get("key")).toBe("val")
    });
});
