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
  let q = query(
    collection(db, collectionName),
    orderBy(orderByField),
    ...filters
  );
  const snapshot = await getCountFromServer(q);
  let totalCount = snapshot.data().count;
  let items: T[] = [];

  if (totalCount) {
    q = query(q, limit(pageSize));

    if (pageNumber > 1) {
      const offset = (pageNumber - 1) * pageSize;
      const initialSnapshot = await getDocs(query(q, limit(offset)));
      const lastVisible = initialSnapshot.docs[initialSnapshot.docs.length - 1];
      if (lastVisible) q = query(q, startAfter(lastVisible));
    }

    const dataSnapshot = await getDocs(q);
    items = dataSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
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
