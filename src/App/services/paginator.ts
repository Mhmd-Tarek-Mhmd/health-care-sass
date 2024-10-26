import {
  query,
  limit,
  getDocs,
  orderBy,
  startAfter,
  collection,
  getCountFromServer,
  QueryFieldFilterConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import { PaginatorResponse } from "@types";

type Args = {
  pageSize: number;
  pageNumber: number;
  orderByField?: string;
  collectionName: string;
  filters?: QueryFieldFilterConstraint[];
};

async function paginator<T>({
  pageSize,
  pageNumber,
  collectionName,
  orderByField = "createdAt",
  filters = [],
}: Args): Promise<PaginatorResponse<T>> {
  const coll = collection(db, collectionName);
  const snapshot = await getCountFromServer(coll);
  const totalCount = snapshot.data().count;
  let items: T[] = [];

  if (totalCount) {
    let q = query(
      collection(db, collectionName),
      orderBy(orderByField),
      limit(pageSize),
      ...filters
    );

    if (pageNumber > 1) {
      const offset = (pageNumber - 1) * pageSize;
      const snapshot = await getDocs(query(q, limit(offset)));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      q = query(q, startAfter(lastVisible));
    }

    const snapshot = await getDocs(q);
    items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
  }

  return {
    items,
    pagination: {
      totalCount,
      page: pageNumber,
      perPage: pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
}

export default paginator;
