import bcrypt from "bcryptjs";
import "reflect-metadata";
import { AppDataSource } from "./data-source.js";
import { UserEntity } from "./modules/user/user.entity.js";

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(UserEntity);
    const fixedId = "11111111-1111-1111-1111-111111111111";
    let user = await repo.findOne({ where: { id: fixedId } });
    if (!user) {
        const passwordHash = await bcrypt.hash("password", 10);
        user = repo.create({
            id: fixedId,
            name: "Test User",
            email: "test@example.com",
            passwordHash,
        });
        await repo.save(user);
        console.log("[seed] created user:", user);
    } else {
        if (!user.email) {
            user.email = "test@example.com";
        }
        if (!user.passwordHash || user.passwordHash.length === 0) {
            user.passwordHash = await bcrypt.hash("password", 10);
        }
        await repo.save(user);
        console.log("[seed] user upserted:", user);
    }
    await AppDataSource.destroy();
}

run().catch((e) => {
    console.error("[seed] error", e);
    process.exit(1);
});
