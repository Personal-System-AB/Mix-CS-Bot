import { Rcon } from 'rcon-client';
import { VetoService } from './vetoService.js';

export class Cs2ServerService {
  private static getConfig() {
    const host = process.env.CS2_SERVER_IP;
    const port = Number(process.env.CS2_SERVER_PORT ?? 27015);
    const password = process.env.CS2_RCON_PASSWORD;
    const serverPassword = process.env.CS2_SERVER_PASSWORD ?? 'mix123';

    if (!host || !password) {
      throw new Error('CS2_SERVER_IP ou CS2_RCON_PASSWORD não configurado.');
    }

    return {
      host,
      port,
      password,
      serverPassword,
    };
  }

  static async send(command: string) {
    const { host, port, password } = this.getConfig();

    const rcon = await Rcon.connect({
      host,
      port,
      password,
    });

    try {
      return await rcon.send(command);
    } finally {
      await rcon.end();
    }
  }

  static async prepareMatch(mapName: string) {
    const { serverPassword } = this.getConfig();

    const map = VetoService.getMapByName(mapName);

    if (!map) {
      throw new Error(`Mapa não encontrado: ${mapName}`);
    }

    await this.send(`sv_password ${serverPassword}`);

    if (map.type === 'workshop') {
      if (!map.workshopId || map.workshopId.includes('COLOQUE')) {
        throw new Error(`Workshop ID inválido para o mapa: ${map.name}`);
      }

      await this.send(`host_workshop_map ${map.workshopId}`);
    } else {
      await this.send(`changelevel ${map.valveMap}`);
    }

    await this.send('mp_autoteambalance 0');
    await this.send('mp_limitteams 0');
    await this.send('mp_restartgame 1');

    return {
      connectUrl: `steam://connect/${process.env.CS2_SERVER_IP}:${process.env.CS2_SERVER_PORT}/${serverPassword}`,
      serverPassword,
    };
  }
}