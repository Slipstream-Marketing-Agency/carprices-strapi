import React, { useEffect, useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@strapi/design-system/Table';
import { BaseHeaderLayout, ContentLayout } from '@strapi/design-system/Layout';
import { Button } from '@strapi/design-system/Button';
import { Select, Option } from '@strapi/design-system/Select';
import { TextInput } from '@strapi/design-system/TextInput';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom'; // Updated to use internal routing
import { request } from '@strapi/helper-plugin';

const CarModelsTable = () => {
  const { formatMessage } = useIntl();
  const [carData, setCarData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageCount: 1, total: 0, pageSize: 10 });
  const [isSearching, setIsSearching] = useState(false);

  const [filters, setFilters] = useState({
    year: '',
    modelName: '',
    brand: '',
    trim: '',
  });

  const fetchCarData = async (page = 1, pageSize = pagination.pageSize) => {
    try {
      const formattedFilters = {
        ...filters,
        year: filters.year,
        modelName: filters.modelName.toLowerCase(),
        trim: filters.trim.toLowerCase(),
        slug: filters.brand.toLowerCase(), // Use `slug` to match the controller’s brand search
      };

      const query = new URLSearchParams({
        _page: page,
        _limit: pageSize,
        ...Object.fromEntries(Object.entries(formattedFilters).filter(([_, value]) => value)),
      }).toString();

      const data = await request(`/api/list-cars?${query}`, { method: 'GET' });
      setCarData(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching car data:', error);
    }
  };

  useEffect(() => {
    fetchCarData(pagination.page, pagination.pageSize);
  }, [pagination.page, pagination.pageSize, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
    setIsSearching(true);
  };

  const handleSearch = () => {
    fetchCarData(1);
    setIsSearching(false);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      year: '',
      modelName: '',
      brand: '',
      trim: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchCarData(1);
  };

  return (
    <ContentLayout>
      <BaseHeaderLayout title={formatMessage({ id: 'car-brands.list-cars', defaultMessage: 'All Cars' })} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextInput
          placeholder="Year"
          label="Year"
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
        />
        <TextInput
          placeholder="Model Name"
          label="Model Name"
          value={filters.modelName}
          onChange={(e) => handleFilterChange('modelName', e.target.value)}
        />
        <TextInput
          placeholder="Brand"
          label="Brand"
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
        />
        <TextInput
          placeholder="Trim"
          label="Trim"
          value={filters.trim}
          onChange={(e) => handleFilterChange('trim', e.target.value)}
        />
        <Button onClick={handleSearch} disabled={!isSearching}>Search</Button>
        <Button variant="secondary" onClick={handleClearFilters}>Clear</Button>
      </div>

      {/* Car Models Table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Brand</Th>
            <Th>Year</Th>
            <Th>Model Name</Th>
            <Th>High Trim Name</Th>
          </Tr>
        </Thead>
        <Tbody>
          {carData.length > 0 ? (
            carData.map((item, index) => (
              <Tr key={index}>
                <Td>
                  <Link to={`/content-manager/collection-types/api::car-brand.car-brand/${item.brandId}?plugins[i18n][locale]=en`}>
                    {item.brand}
                  </Link>
                </Td>
                <Td>{item.year}</Td>
                <Td>
                  <Link to={`/content-manager/collection-types/api::car-model.car-model/${item.modelId}?plugins[i18n][locale]=en`}>
                    {item.modelName}
                  </Link>
                </Td>
                <Td>
                  <Link to={`/content-manager/collection-types/api::car-trim.car-trim/${item.trimId}?plugins[i18n][locale]=en`}>
                    {item.highTrimName}
                  </Link>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={4} style={{ textAlign: 'center' }}>No results found</Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        {/* Page Size Selector */}
        <Select
          label="Items per page"
          onChange={(value) => handlePageSizeChange(value)}
          value={pagination.pageSize}
        >
          <Option value={10}>10</Option>
          <Option value={20}>20</Option>
          <Option value={50}>50</Option>
          <Option value={100}>100</Option>
        </Select>

        {/* Pagination Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="secondary"
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={pagination.page === pagination.pageCount}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
};

export default CarModelsTable;
