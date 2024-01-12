import User from "../../models/userModel";
import dbConnect from "../../lib/dbConnect";

export async function getData() {
  // Fetch all data from the collection
  await dbConnect();
  const result = await User.find({});

  return result;
}

export async function createData(newData: any) {
  // Create a new instance of the Data model and save it to the database
  await dbConnect();
  const data = new User(newData);
  if (await User.findOne({ userEmail: data.userEmail })) {
    await User.updateOne(
      { userEmail: data.userEmail },
      { $set: { amount: data.amount, status: data.status } },
    );
  } else {
    await data.save();
  }

  return data;
}
