import AsyncStorage from "@react-native-async-storage/async-storage";

export async function retrieveItem(key) {
  try {
    const retrievedItem = await AsyncStorage.getItem(key);
    if (retrievedItem) {
      return retrievedItem;
    }
  } catch (error) {
    console.warn(error.message);
  }
}

export async function storeItem(key, item) {
  try {
    const jsonOfItem = await AsyncStorage.setItem(
      key,
      JSON.stringify(item)
        .replace('"', "")
        .replace('"', "")
    );
    return jsonOfItem;
  } catch (error) {
    console.log(error.message);
  }
}
