

/**
 * @type {import('@src/structures').SlashCommands}
 */
 
 module.exports = {
   cooldown: 15,
   data: {
     name: 'traveling-spirit',
     description: 'get current/upcoming ts details',
     longDesc: 'To be decided'
   },
   
   async execute() {
     const [ name, location, tree, total ] = client.ts;
     const nm = name ? name : 'Unknown';
   }
 }