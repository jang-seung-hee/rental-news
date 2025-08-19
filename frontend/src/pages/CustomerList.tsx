import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subscriptionType: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: '김철수',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        company: 'ABC 렌탈',
        subscriptionType: '프리미엄',
        joinDate: '2024-01-15',
        status: 'active',
        lastLogin: '2024-01-20 14:30'
      },
      {
        id: '2',
        name: '이영희',
        email: 'lee@example.com',
        phone: '010-2345-6789',
        company: 'XYZ 렌탈',
        subscriptionType: '기본',
        joinDate: '2024-01-10',
        status: 'active',
        lastLogin: '2024-01-19 09:15'
      },
      {
        id: '3',
        name: '박민수',
        email: 'park@example.com',
        phone: '010-3456-7890',
        company: 'DEF 렌탈',
        subscriptionType: '프리미엄',
        joinDate: '2024-01-05',
        status: 'inactive',
        lastLogin: '2024-01-15 16:45'
      }
    ];

    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { text: '활성', className: 'bg-green-100 text-green-800' },
      inactive: { text: '비활성', className: 'bg-red-100 text-red-800' },
      pending: { text: '대기중', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const handleCustomerClick = (customerId: string) => {
    // 고객 상세 페이지로 이동
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            등록된 고객 목록을 확인하고 관리할 수 있습니다.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate('/customers/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            새 고객 등록
          </button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              id="search"
              placeholder="이름, 이메일, 회사명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="pending">대기중</option>
            </select>
          </div>
        </div>
      </div>

      {/* 고객 목록 */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객 정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회사
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구독 유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  최근 로그인
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || filterStatus !== 'all' ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.subscriptionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(customer.joinDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.lastLogin}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">총 고객 수</div>
          <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">활성 고객</div>
          <div className="text-2xl font-bold text-green-600">
            {customers.filter(c => c.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">프리미엄 구독</div>
          <div className="text-2xl font-bold text-blue-600">
            {customers.filter(c => c.subscriptionType === '프리미엄').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">이번 달 신규</div>
          <div className="text-2xl font-bold text-purple-600">
            {customers.filter(c => {
              const joinDate = new Date(c.joinDate);
              const now = new Date();
              return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerList; 