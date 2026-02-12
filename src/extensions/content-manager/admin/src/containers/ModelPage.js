import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request } from '@strapi/helper-plugin';
import TrimWithYear from '../../components/TrimWithYear';

const ModelPage = () => {
  const { id } = useParams();
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    const fetchModelData = async () => {
      const response = await request(`/content-manager/collection-types/api::car-model.car-model/${id}`, {
        method: 'GET',
      });
      setModelData(response);
    };

    fetchModelData();
  }, [id]);

  if (!modelData) return <p>Loading...</p>;

  return (
    <div>
      <h1>{modelData.name}</h1>
      <h2>Trims with Years</h2>
      <TrimWithYear trims={modelData.car_trims} />
    </div>
  );
};

export default ModelPage;
