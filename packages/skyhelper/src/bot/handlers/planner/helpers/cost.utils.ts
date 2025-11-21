import { currency } from "@skyhelperbot/constants";
import { SpiritTreeHelper, type ICost, type INode, type ISkyData, type ISpiritTree, type ISpiritTreeTier } from "skygame-data";

const Empty_Cost = { h: 0, c: 0, sc: 0, sh: 0, ac: 0, ec: 0 };
export class CostUtils {
  /**
   * Formats cost object with corresponding emoji
   * @param costs The cost object
   * @param remaining The cost object denoting remaining amount the user needs to unlock (for progress)
   */
  static costToEmoji(costs: ICost, remaining?: ICost) {
    const parts = [];
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    if (costs.h) parts.push(`${remaining ? `${remaining.h || "✓"} (${costs.h})` : costs.h} <:Heart:${currency.h}>`);
    if (costs.c) parts.push(`${remaining ? `${remaining.c || "✓"} (${costs.c})` : costs.c} <:Candle:${currency.c}>`);
    if (costs.sc) parts.push(`${remaining ? `${remaining.sc || "✓"} (${costs.sc})` : costs.sc} <:SeasonCandle:${currency.sc}>`);
    if (costs.sh) parts.push(`${remaining ? `${remaining.sh || "✓"} (${costs.sh})` : costs.sh} <:SeasonHeart:${currency.sh}>`);
    if (costs.ac) parts.push(`${remaining ? `${remaining.ac || "✓"} (${costs.ac})` : costs.ac} <:AC:${currency.ac}>`);
    if (costs.ec) parts.push(`${remaining ? `${remaining.ec || "✓"} (${costs.ec})` : costs.ec} <:EventTicket:${currency.ec}>`);
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
    return parts.join(" ") || null;
  }

  /** Calculate total costs of given nodes, returning the cost object */
  static calculateCosts(nodes: INode[]): NonNullable<ICost> {
    return nodes.reduce((acc, node) => {
      Object.keys(acc).forEach((k) => ((acc as any)[k] += (node as any)[k] ?? 0));
      return acc;
    }, { ...Empty_Cost });
  }

  /** Calcualte the combined remaining cost of the nodes based on progress */
  static calculateRemainingCosts(nodes: INode[]) {
    return nodes.reduce((acc, node) => {
      if (!(node.item?.unlocked ?? false)) {
        Object.keys(acc).forEach((k) => ((acc as any)[k] += (node as any)[k] ?? 0));
      }
      return acc;
    }, { ...Empty_Cost });

  }

  /**
   * Returns to formatted cost of all the nodes in the spirit tree
   * @param tree The spirit tree
   * @param withProgress Whether to also include remaining cost
   */
  static treeToCostEmoji(tree: ISpiritTree, withProgress = false) {
    const nodes = SpiritTreeHelper.getNodes(tree);
    return this.costToEmoji(this.calculateCosts(nodes), withProgress ? this.calculateRemainingCosts(nodes) : undefined);
  }

  /** Calculate and return the combined formatted cost of the provided objects that may contain cost details,
   * this can be a spirit tree, or a node, or an ICost Object
   * This allows to pass various unrelated object and get combined costs of all the nodes from them
   */
  static groupedToCostEmoji(objs: Array<ISpiritTree | INode | ISpiritTreeTier | ICost>) {
    const currencies = { ...Empty_Cost }; // shallow clone
    const addCosts = (costs: ICost) => {
      for (const key in currencies) {
        // eslint-disable-next-line
        currencies[key as keyof typeof currencies] += costs[key as keyof typeof costs] || 0;
      }
    };

    for (const obj of objs) {
      if (typeof (obj as any)?.guid === "string" && "rows" in (obj as any)) {
        // ISpiritTreeTier
        addCosts(this.calculateCosts(SpiritTreeHelper.getNodes({ guid: "", tier: obj as ISpiritTreeTier })));
      } else if (typeof (obj as any)?.guid === "string" && ("node" in (obj as any) || "tier" in (obj as any))) {
        // ISpiritTree (classic or tiered)
        addCosts(this.calculateCosts(SpiritTreeHelper.getNodes(obj as ISpiritTree)));
      } else if (typeof (obj as any)?.guid === "string") {
        // INode
        addCosts(this.calculateCosts([obj as INode]));
      } else {
        // Plain cost-like object
        addCosts(obj as ICost);
      }
    }
    return this.costToEmoji(currencies);
  }

  /** Returns the cost key of the cost object */
  static getCostKey(cost: ICost) {
    if (cost.h) return "h";
    if (cost.c) return "c";
    if (cost.sc) return "sc";
    if (cost.sh) return "sh";
    if (cost.ac) return "ac";
    if (cost.ec) return "ec";
    return null;
  }
}
