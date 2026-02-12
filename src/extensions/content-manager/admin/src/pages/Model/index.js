// src/extensions/content-manager/admin/src/pages/Model/index.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { request } from '@strapi/helper-plugin';
import { Box, Typography } from '@strapi/design-system';

const ModelEditPage = () => {
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
    <Box padding={4}>
      <Typography variant="alpha">{modelData.name}</Typography>
      <Typography variant="beta">Car Trims with Year</Typography>
      <Box paddingTop={4}>
        {modelData.car_trims && modelData.car_trims.length > 0 ? (
          modelData.car_trims.map((trim) => (
            <Box key={trim.id} paddingBottom={2}>
              <Typography variant="delta">
                {trim.name} - {trim.year}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No trims available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ModelEditPage;
