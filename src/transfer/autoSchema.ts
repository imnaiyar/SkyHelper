import mongoose, { Document } from "mongoose";
interface autoSchema extends Document {
    _id: string;
    messageId: string;
    channelId: string;
    webhook: {
        id: string;
        token: string;
    };
}
const Schema = new mongoose.Schema<autoSchema>({
    _id: String,
    channelId: String,
    messageId: String,
    webhook: {
        id: String,
        token: String
    }
});

export const autoShard = mongoose.model("autoShard", Schema);
export const autoTimes = mongoose.model("autoTimes", Schema);

export const getShard = async () => await autoShard.find();
export const getTimes = async () => await autoTimes.find();
