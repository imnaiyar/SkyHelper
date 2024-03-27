class UpdateTS {
  constructor(client){
    this.client = client;
    this.ts = client.ts;
  }
  
  setName(name) {
    if (!name) throw new Error('Spirit name must be provided');
    if (typeof name !== 'string') throw new Error('Spirit name must be a string');
    this.ts.name = name;
    return this.ts;
  }
  
  setVisitDate(date) {
    if (!date) throw new Error('Visit date must be provided');
    if (typeof date !== 'string') throw new Error('Date must be a string');
    this.ts.visitDate = data;
    return this.ts;
  }
  
  setValue(value) {
    if (!value) throw new Error('Spirit value must be provided');
    if (typeof value !== 'string') throw new Error('Value must be a string');
    this.ts.value = value;
    return this.ts;
  }
  
  setSpiritImage(link) {
    if (!link) throw new Error('Spirit image link must be provided');
    if (typeof link !== 'string') throw new Error('Link must be a string');
    this.ts.spiritImage = link;
    return this.ts;
  }
  
  setIndex(index) {
    if (!index) throw new Error('Spirit index must be provided');
    if (typeof index !== 'string') throw new Error('Index must be a string');
    this.ts.index = index;
    return this.ts;
  }
}