import "reflect-metadata";
import { AppDataSource } from "./data-source.js";
import { User } from "./entities/User.js";

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);
    const fixedId = "11111111-1111-1111-1111-111111111111";
    let user = await repo.findOne({ where: { id: fixedId } });
    if (!user) {
        user = repo.create({ id: fixedId, name: "Test User" });
        await repo.save(user);
        console.log("[seed] created user:", user);
    } else {
        console.log("[seed] user already exists:", user);
    }
    await AppDataSource.destroy();
}

run().catch((e) => {
    console.error("[seed] error", e);
    process.exit(1);
});
