export const getHospitals = async (page: number = 1, perPage: number = 1) => {
  const res = await fetch(
    `https://reqres.in/api/users?page=${page}&per_page=${perPage}`
  );
  const data = await res.json();

  return data;
};