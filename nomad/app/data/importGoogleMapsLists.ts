// nomad/app/data/importGoogleMapsLists.ts
import {
  addGoogleMapsList,
  getAllGoogleMapsLists,
  deleteGoogleMapsList,
} from "./googleMapsDb";
import demoGoogleMapsLists from "./demoGoogleMapsLists";

export async function importDemoGoogleMapsLists() {
  const existingLists = await getAllGoogleMapsLists();
  //check if each has a listname and id
  const existingNames = new Set(
    existingLists.map((l: any) => l.listName).filter(Boolean)
  );

  for (const list of demoGoogleMapsLists) {
    if (existingNames.has(list.listName)) {
      console.log(`Skipped duplicate list '${list.listName}'`);
      continue;
    }
    try {
      const id = await addGoogleMapsList(list);
      console.log(`Imported list '${list.listName}' (ID: ${id})`);
    } catch (e) {
      console.error(`Failed to import list '${list.listName}':`, e);
    }
  }
  console.log("Import complete.");

  //remove duplicates from Firestore
  const allLists = await getAllGoogleMapsLists();
  const seen = new Set<string>();
  for (const l of allLists) {
    const listName = (l as any).listName;
    const id = (l as any).id;
    if (!listName || !id) continue;
    if (seen.has(listName)) {
      await deleteGoogleMapsList(id);
      console.log(`Deleted duplicate list '${listName}' (ID: ${id})`);
    } else {
      seen.add(listName);
    }
  }
}
