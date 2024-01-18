import Prompt from "../../models/promptModel";
import dbConnect from "../../lib/dbConnect";

export async function getPrompt() {
  // Fetch all data from the collection
  await dbConnect();
  const result = await Prompt.find({});

  return result;
}

export async function createPrompt(newData: any) {
  // Create a new instance of the Data model and save it to the database
  await dbConnect();
  const data = new Prompt(newData);
  if (await Prompt.findOne({ id: data.id })) {
    await Prompt.updateOne(
      { id: data.id },
      { $set: { title: data.title, content: data.content } },
    );
  } else {
    await data.save();
  }

  return data;
}
