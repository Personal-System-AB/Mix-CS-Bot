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

  private static async safeSend(rcon: Rcon, command: string) {
    try {
      console.log(`🎮 RCON > ${command}`);
      return await rcon.send(command);
    } catch (error) {
      console.warn(`⚠️ Comando RCON falhou/foi interrompido: ${command}`);
      return null;
    }
  }

  private static async connectWithRetry(
    host: string,
    port: number,
    password: string,
    retries = 10
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        return await Rcon.connect({ host, port, password });
      } catch {
        await this.sleep(3000);
      }
    }

    throw new Error('Não foi possível reconectar ao RCON depois da troca de mapa.');
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

    const selectedMap = VetoService.getMapByName(mapName);

    if (!selectedMap) {
      throw new Error(`Mapa não encontrado: ${mapName}`);
    }

    let rcon = await Rcon.connect({ host, port, password });

    try {
      await this.safeSend(rcon, `sv_password ${serverPassword}`);
      await this.safeSend(rcon, 'sv_lan 0');

      if (selectedMap.type === 'workshop') {
        if (!selectedMap.workshopId || selectedMap.workshopId.includes('COLOQUE')) {
          throw new Error(`Workshop ID inválido para o mapa: ${selectedMap.name}`);
        }

        await this.safeSend(rcon, `host_workshop_map ${selectedMap.workshopId}`);
      } else {
        if (!selectedMap.valveMap) {
          throw new Error(`Valve map inválido para o mapa: ${selectedMap.name}`);
        }

        await this.safeSend(rcon, `changelevel ${selectedMap.valveMap}`);
      }
    } finally {
      await rcon.end().catch(() => { });
    }

    await this.sleep(15000);

    rcon = await this.connectWithRetry(host, port, password);

    try {
      await this.safeSend(rcon, 'sv_lan 0');
      await this.safeSend(rcon, `sv_password ${serverPassword}`);
      await this.safeSend(rcon, 'mp_autoteambalance 0');
      await this.safeSend(rcon, 'mp_limitteams 0');
      await this.safeSend(rcon, 'bot_kick');

      // deixa esperando todos entrarem
      await this.safeSend(rcon, 'mp_do_warmup_period 1');
      await this.safeSend(rcon, 'mp_warmuptime 999999');
      await this.safeSend(rcon, 'mp_warmup_start');
    } finally {
      await rcon.end().catch(() => { });
    }

    return {
      connectUrl: `steam://connect/${host}:${port}/${serverPassword}`,
      connectCommand: `password ${serverPassword}\nconnect ${host}:${port}`,
      serverPassword,
    };
  }

  static async lockServerForPlayers() {
    const { host, port, password, serverPassword } = this.getConfig();

    const rcon = await Rcon.connect({ host, port, password });

    try {
      await this.safeSend(rcon, 'sv_lan 0');
      await this.safeSend(rcon, `sv_password ${serverPassword}`);

      // segura o jogo em warmup até admin iniciar
      await this.safeSend(rcon, 'mp_do_warmup_period 1');
      await this.safeSend(rcon, 'mp_warmuptime 999999');
      await this.safeSend(rcon, 'mp_warmup_start');

      await this.safeSend(rcon, 'mp_autoteambalance 0');
      await this.safeSend(rcon, 'mp_limitteams 0');
      await this.safeSend(rcon, 'bot_kick');
    } finally {
      await rcon.end().catch(() => { });
    }
  }

  static async startLiveMatch() {
    const { host, port, password } = this.getConfig();

    const rcon = await Rcon.connect({ host, port, password });

    try {
      await this.safeSend(rcon, 'mp_warmup_end');
      await this.safeSend(rcon, 'mp_restartgame 3');
    } finally {
      await rcon.end().catch(() => { });
    }
  }
}