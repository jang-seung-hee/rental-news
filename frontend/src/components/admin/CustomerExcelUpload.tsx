import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { parseExcelFile, validateExcelFile, createExcelTemplate } from '../../utils/excelUtils';
import { createCustomersBatch } from '../../services/customerService';
import { ExcelCustomerData } from '../../types/customer';
import LoadingSpinner from '../common/LoadingSpinner';

interface CustomerExcelUploadProps {
  onComplete: () => void;
}

const CustomerExcelUpload: React.FC<CustomerExcelUploadProps> = ({ onComplete }) => {
  const [uploadedData, setUploadedData] = useState<ExcelCustomerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('파일 선택됨:', file.name, file.size, file.type);

    // 파일 형식 검증
    if (!validateExcelFile(file)) {
      console.error('지원하지 않는 파일 형식:', file.type);
      toast({
        title: "오류",
        description: "지원하지 않는 파일 형식입니다. (.xlsx, .xls, .csv 파일만 가능)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('파일 파싱 시작...');
      const data = await parseExcelFile(file);
      console.log('파싱 완료, 데이터:', data);
      
      setUploadedData(data);
      
      toast({
        title: "성공",
        description: `${data.length}개의 고객 데이터를 읽었습니다.`,
      });
    } catch (error) {
      console.error('파일 업로드 에러:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "파일 파싱에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 일괄 등록 처리
  const handleBatchUpload = async () => {
    if (uploadedData.length === 0) {
      toast({
        title: "오류",
        description: "업로드할 데이터가 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      console.log('일괄 등록 시작, 데이터 수:', uploadedData.length);
      console.log('등록할 데이터:', uploadedData);
      
      await createCustomersBatch(uploadedData);
      
      console.log('일괄 등록 완료');
      
      toast({
        title: "성공",
        description: `${uploadedData.length}명의 고객이 일괄 등록되었습니다.`,
      });
      
      onComplete();
    } catch (error) {
      console.error('일괄 등록 에러:', error);
      toast({
        title: "오류",
        description: "일괄 등록에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = () => {
    createExcelTemplate();
    toast({
      title: "성공",
      description: "엑셀 템플릿이 다운로드되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 파일 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>엑셀 파일 업로드</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => document.getElementById('excel-file')?.click()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? '파일 처리 중...' : '엑셀 파일 선택'}
            </Button>
            <Button
              onClick={handleDownloadTemplate}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              템플릿 다운로드
            </Button>
          </div>
          
          <input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="text-sm text-gray-600">
            <p>• 지원 형식: .xlsx, .xls, .csv</p>
            <p>• 필수 컬럼: 고객그룹, 고객명, 휴대폰번호, 현재상품, 설치일자, 의무사용기간</p>
            <p>• 첫 번째 행은 헤더로 처리됩니다.</p>
          </div>
        </CardContent>
      </Card>

      {/* 업로드된 데이터 미리보기 */}
      {uploadedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>업로드된 데이터 미리보기 ({uploadedData.length}개)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>고객 그룹</TableHead>
                    <TableHead>고객명</TableHead>
                    <TableHead>휴대폰번호</TableHead>
                    <TableHead>현재 상품</TableHead>
                    <TableHead>설치일자</TableHead>
                    <TableHead>의무사용기간</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedData.slice(0, 10).map((customer, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="secondary">{customer.customerGroup}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{customer.customerName}</TableCell>
                      <TableCell>{customer.phoneNumber}</TableCell>
                      <TableCell>{customer.currentProduct}</TableCell>
                      <TableCell>
                        {customer.installationDate ? new Date(customer.installationDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.mandatoryUsagePeriod}년</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {uploadedData.length > 10 && (
              <p className="text-sm text-gray-600 mt-2">
                ... 외 {uploadedData.length - 10}개 더
              </p>
            )}
            
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleBatchUpload}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    일괄 등록 중...
                  </>
                ) : (
                  `${uploadedData.length}명 일괄 등록`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerExcelUpload; 