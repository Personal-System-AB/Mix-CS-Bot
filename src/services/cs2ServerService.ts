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

    return { host, port, password, serverPassword };
  }

  private static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async send(command: string) {
    const { host, port, password } = this.getConfig();

    const rcon = await Rcon.connect({ host, port, password });

    try {
      return await rcon.send(command);
    } finally {
      await rcon.end().catch(() => { });
    }
  }

  static async prepareMatch(mapName: string) {
    const { host, port, password, serverPassword } = this.getConfig();

    const map = VetoService.getMapByName(mapName);

    if (!map) {
      throw new Error(`Mapa não encontrado: ${mapName}`);
    }

    let rcon = await Rcon.connect({ host, port, password });

    try {
      await rcon.send(`sv_password ${serverPassword}`);
      await rcon.send('sv_lan 0');

      if (map.type === 'workshop') {
        if (!map.workshopId || map.workshopId.includes('COLOQUE')) {
          throw new Error(`Workshop ID inválido para o mapa: ${map.name}`);
        }

        await rcon.send(`host_workshop_map ${map.workshopId}`);
      } else {
        if (!map.valveMap) {
          throw new Error(`Valve map inválido para o mapa: ${map.name}`);
        }

        await rcon.send(`changelevel ${map.valveMap}`);
      }
    } finally {
      await rcon.end().catch(() => { });
    }

    // Troca de mapa derruba/recarrega RCON por alguns segundos.
    await this.sleep(8000);

    rcon = await Rcon.connect({ host, port, password });

    try {
      await rcon.send('sv_lan 0');
      await rcon.send(`sv_password ${serverPassword}`);
      await rcon.send('mp_autoteambalance 0');
      await rcon.send('mp_limitteams 0');
      await rcon.send('mp_restartgame 1');
    } finally {
      await rcon.end().catch(() => { });
    }

    return {
      connectUrl: `steam://connect/${host}:${port}/${serverPassword}`,
      serverPassword,
    };
  }
}