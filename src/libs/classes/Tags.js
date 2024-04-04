class Tags {
  constructor(message) {
    this.message = message;
    this.flags = null;
    const flagRegex = /--([^\s]+(?:=[^\s]+)?)/g;
    const flags = [];
    let match;
    while ((match = flagRegex.exec(msg.content)) !== null) {
      flags.push(match[1]);
    }
    if (flags.length) this.flags = flags;
  }

  getFlag(flag) {
    if (!flag) throw new TypeError("Valid flag must be provided as a parameter.");
    if (!this.flags) return null;
    return this.flags.find((fl) => fl.startsWith(flag));
  }

  has(flag) {
    if (!flag) throw new TypeError("Valid flag(s) must be provided as a parameter.");
    if (typeof flag !== "string" && !Array.isArray(flag))
      throw new TypeError('Parameter flag must of type "string" or "array"');
    if (!this.flags) return false;
    return this.flags.includes(flags);
  }

  hasAny(flags) {
    if (!flags) throw new TypeErro("Valid flags must be provided as a parameter");
    if (Array.isArray(flags)) throw new TypeError('An array must be provided');
    if (!this.flags) return false;
    return this.flags.some((fl) => fl.startsWith)
  }
}
