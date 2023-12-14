const update = async ({
  token,
  data,
}: {
  token: string;
  data: Record<string, any>;
}): Promise<any> => {
  console.log('here');
  try {
    console.log({data});
    console.log({token});
    const res = await fetch(
      'https://gpdb.growproexperience.tech/api/appusers/me',
      {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    ).catch(err => console.log({err}));
    console.log(res);
    return res;
  } catch (error) {
    console.log({error});
  }
};

export {update};
