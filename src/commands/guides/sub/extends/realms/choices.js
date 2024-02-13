
const spirits = require('../../shared/spiritsData');
const firstChoices = [
  {
    label: "Isle of Dawn",
    value: "isle",
    emoji: "<:Isle:1150605424752590868>",
  },
  {
    label: "Daylight Prairie",
    value: "prairie",
    emoji: "<:Prairie:1150605405408473179>",
  },
  {
    label: "Hidden Forest",
    value: "forest",
    emoji: "<:Forest:1150605383656800317>",
  },
  {
    label: "Valley of Triumph",
    value: "valley",
    emoji: "<:Valley:1150605355777273908>",
  },
  {
    label: "Golden Wasteland",
    value: "wasteland",
    emoji: "<:Wasteland:1150605333862027314>",
  },
  {
    label: "Vault of Knowledge",
    value: "vault",
    emoji: "<:Vault:1150605308364861580>",
  },
  {
    label: "Eye of Eden",
    value: "eden",
    emoji: "<:eden:1205960597456293969>",
  },
];

const data = Object.entries(spirits)
const getSpiritsObj = (realm, type) => {
  return data.filter(([k, v]) => v.realm === realm && v.type === type ).map(([k, v]) => ({
    label: v.name,
    value: k,
    emoji: v?.emote?.icon || v?.stance?.icon || v?.call?.icon,
  }))
}
const spiritChoices = {
  isle_regular: getSpiritsObj('Isle of Dawn', 'Regular Spirit'),

  isle_seasonal: getSpiritsObj('Isle of Dawn', 'Seasonal Spirit'),

  prairie_regular: getSpiritsObj('Daylight Prairie', 'Regular Spirit'),
  prairie_seasonal: getSpiritsObj('Daylight Prairie', 'Seasonal Spirit'),

  forest_regular: getSpiritsObj('Hidden Forest', 'Regular Spirit'),
  forest_seasonal: getSpiritsObj('Hidden Forest', 'Seasonal Spirit'),

  valley_regular: getSpiritsObj('Valley of Triumph', 'Regular Spirit'),
  valley_seasonal: getSpiritsObj('Valley of Triumph', 'Seasonal Spirit'),

  wasteland_regular: getSpiritsObj('Golden Wasteland', 'Regular Spirit'),
  wasteland_seasonal: getSpiritsObj('Golden Wasteland', 'Seasonal Spirit'),

  vault_regular: getSpiritsObj('Vault of Knowledge', 'Regular Spirit'),
  vault_seasonal: getSpiritsObj('Vault of Knowledge', 'Seasonal Spirit'),
}

module.exports = { firstChoices, spiritChoices };
