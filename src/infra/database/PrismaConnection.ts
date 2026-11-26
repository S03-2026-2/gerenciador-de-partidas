import { PrismaClient } from '@prisma/client';

export class PrismaConnection {
    private static client?: PrismaClient;

    private constructor() {}

    public static getClient(): PrismaClient {
        this.client ??= new PrismaClient();
        return this.client;
    }

    public static async desconectar(): Promise<void> {
        const client = this.client;
        this.client = undefined;
        await client?.$disconnect();
    }
}
