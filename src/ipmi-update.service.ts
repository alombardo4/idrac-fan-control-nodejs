import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import {exec, ExecException} from 'child_process'

@Injectable()
export class IPMIUpdateService implements OnModuleInit {
    private readonly logger = new Logger(IPMIUpdateService.name)

    @Cron('*/30 * * * * *')
    async handleCron(): Promise<void> {
        this.logger.log('Running update cycle...')
        await this.runSync()
    }

    async onModuleInit(): Promise<void> {
        await this.runSync()
    }

    async runSync(): Promise<void> {
        this.logger.log('Sync started')
        const username = process.env.USER
        if (!username) {
            throw new Error('No $USER set!')
        }
        const password = process.env.PASSWORD
        if (!password) {
            throw new Error('No $PASSWORD set!')
        }
        const host = process.env.HOST
        if (!host) {
            throw new Error('No $HOST set!')
        }
        const fanspeedPercent = process.env.FANSPEED
        if (!fanspeedPercent) {
           throw new Error(`No $FANSPEED set!'`) 
        }
        let parsedFanspeed: number
        try {
            parsedFanspeed = parseInt(fanspeedPercent, 10)
            if ( Object.is(parsedFanspeed, NaN) || parsedFanspeed > 100 || parsedFanspeed < 1) {
                throw new Error(`Fanspeed ${fanspeedPercent} (${parsedFanspeed}) invalid!`)
            }
        } catch (error) {
            this.logger.error(error)
            throw new Error('$FANSPEED must be an integer between 1 and 100')
        }

        const temp = await this.getTemperature(host, username, password)

        if (temp > 35) {
            await this.switchToAuto(host, username, password)
        } else {
            await this.switchToManual(host, username, password)
            await this.setFanSpeed(host, username, password, parsedFanspeed)
        }
        this.logger.log('Sync finished!')
    }

    async getTemperature(host: string, user: string, password: string): Promise<number> {
        const result = await this.runIPMICommand(host, user, password, 'sdr type temperature')
        const tempGroups = result.split('\n')
        const inletTemp = tempGroups.find(t => t.includes('Inlet'))
        if (!inletTemp) {
            return 100
        } 
        const temp = inletTemp.split('|').find(t => t.includes('degrees C'))?.trim()
        if (!temp) {
            return 100
        }

        const parsedTemp = parseInt(temp.replace(' degrees C', ''))
        this.logger.log(`Current temperature: ${parsedTemp}C`)
        return parsedTemp
    }

    runIPMICommand(host: string, user: string, password: string, command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(`ipmitool -I lanplus -H ${host} -U ${user} -P ${password} ${command}`, (error: ExecException, stdout: string) => {
                if (error) {
                    return reject(error)
                } else {
                    return resolve(stdout)
                }
            })
        })
    }

    async switchToAuto(host: string, user: string, password: string): Promise<void> {
        this.logger.log('Using auto control mode')
        await this.runIPMICommand(host, user, password, 'raw 0x30 0x30 0x01 0x01')
        this.logger.log('Running in auto control mode')
    }

    async switchToManual(host: string, user: string, password: string): Promise<void> {
        this.logger.log('Using manual control mode')
        await this.runIPMICommand(host, user, password, 'raw 0x30 0x30 0x01 0x00')
        this.logger.log('Running in manual control mode')
    }

    async setFanSpeed(host: string, user: string, password: string, percent: number): Promise<void> {
        if (percent < 1) {
            percent = 1
        }
        const hexString = `0x${percent.toString(16)}`
        this.logger.log(`Setting fanspeed to ${hexString}`)
        await this.runIPMICommand(host, user, password, `raw 0x30 0x30 0x02 0xff ${hexString}`)
        this.logger.log(`Fanspeed set to ${hexString}`)
    }
}