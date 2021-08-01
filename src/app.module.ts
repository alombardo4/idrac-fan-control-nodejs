import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { IPMIUpdateService } from "./ipmi-update.service";

@Module({
    imports: [
        ScheduleModule.forRoot(),
    ],
    providers: [
        IPMIUpdateService,
    ],
})
export class AppModule {}