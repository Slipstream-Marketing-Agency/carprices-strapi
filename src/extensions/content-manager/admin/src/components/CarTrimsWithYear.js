// src/extensions/content-manager/admin/src/components/CarTrimsWithYear.js
import React from 'react';

const CarTrimsWithYear = ({ trims }) => {
  return (
    <div>
      {trims.map((trim) => (
        <div key={trim.id} style={{ padding: '5px 0' }}>
          <strong>{trim.name}</strong> - {trim.year}
        </div>
      ))}
    </div>
  );
};

export default CarTrimsWithYear;
