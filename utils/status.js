const fivem = require("fivem");

const status = (address) => {
  return new Promise(async (resolve, reject) => {
    var start = new Date();
    var server = new fivem.Server(address);
    try {
      var status = await server.getServer()
      var end = new Date();
      var players = await server.getPlayers()
      var result = {
        favicon: status.icon,
        players: {
          online: players,
          max: status.vars.sv_maxClients
        },
        version: {
          name: status.vars.sv_enforceGameBuild
        },
        roundTripLatency: end-start,
      }
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { status };
