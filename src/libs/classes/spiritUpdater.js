

class UpdateSeasonalSpirit{
  constructor(value){
    this.spiritValue = value;
    this.ts = null;
    this.tree = null;
    this.locations = null;
    this.expression = null;
    this.cosmetics = null;
  }
  
  setTS(options) {
    if (typeof options !== 'object') throw new TypeError('Provide options must be an object');
    
  }
}