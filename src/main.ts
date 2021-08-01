import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule)
    await app.init()
}

bootstrap()
    .then(() => console.log('Started!'))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })