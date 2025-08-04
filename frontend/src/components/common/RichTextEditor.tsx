import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { uploadImage } from '../../services/firebaseUtils';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  height?: string;
  onImageUpload?: (file: File) => Promise<string>;
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  className,
  readOnly = false,
  height = '300px',
  onImageUpload,
  fullscreen = false,
  onFullscreenChange
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');

  // 색상 옵션
  const colorOptions = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb',
    '#a52a2a', '#808080', '#000080', '#800000', '#808000', '#008080'
  ];

  // 기본 이미지 업로드 함수
  const defaultImageUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImage(file, 'promotions');
      return imageUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  // 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 에디터 높이 설정
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = height;
    }
  }, [height]);

  // 외부 클릭 시 색상 선택기 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  // ESC 키로 전체화면 해제
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreen && onFullscreenChange) {
        onFullscreenChange(false);
      }
    };

    if (fullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // 전체화면 모드일 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 전체화면 모드가 아닐 때 body 스크롤 복원
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 컴포넌트 언마운트 시 body 스크롤 복원
      document.body.style.overflow = '';
    };
  }, [fullscreen, onFullscreenChange]);

  // 내용 변경 핸들러
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // 포커스 핸들러
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // 이미지 업로드 핸들러
  const handleImageUpload = async () => {
    const imageUploadHandler = onImageUpload || defaultImageUpload;
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file && editorRef.current) {
        try {
          const imageUrl = await imageUploadHandler(file);
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '0.5rem 0';
          img.style.borderRadius = '0.25rem';
          
          // 현재 커서 위치에 이미지 삽입
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            range.collapse(false);
          } else {
            editorRef.current.appendChild(img);
          }
          
          handleInput();
        } catch (error) {
          console.error('이미지 업로드 실패:', error);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
  };

  // 툴바 버튼 핸들러들
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('링크 URL을 입력하세요:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // 가로선 삽입
  const insertHorizontalRule = () => {
    const hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '2px solid #e2e8f0';
    hr.style.margin = '1rem 0';
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(hr);
      range.collapse(false);
    } else if (editorRef.current) {
      editorRef.current.appendChild(hr);
    }
    
    handleInput();
  };

  // 색상 변경
  const changeTextColor = (color: string) => {
    setSelectedColor(color);
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  // 커스텀 색상 입력
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSelectedColor(color);
    changeTextColor(color);
  };

  // 전체화면 토글 핸들러
  const handleFullscreenToggle = () => {
    if (onFullscreenChange) {
      onFullscreenChange(!fullscreen);
    }
  };

  return (
    <div className={cn('rich-text-editor', className)}>
      {/* 툴바 */}
      {!readOnly && (
        <div className="editor-toolbar">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="toolbar-btn"
            title="굵게"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="toolbar-btn"
            title="기울임"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="toolbar-btn"
            title="밑줄"
          >
            <u>U</u>
          </button>
          
          {/* 색상 선택기 */}
          <div className="color-picker-container" ref={colorPickerRef}>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="toolbar-btn color-btn"
              title="글자 색상"
              style={{ color: selectedColor }}
            >
              🎨 색상
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                <div className="color-grid">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="color-option"
                      style={{ backgroundColor: color }}
                      onClick={() => changeTextColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="custom-color-input">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={handleCustomColorChange}
                    className="color-input"
                    title="커스텀 색상"
                  />
                  <span className="custom-color-label">커스텀 색상</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="toolbar-btn"
            title="글머리 기호"
          >
            • 목록
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="toolbar-btn"
            title="번호 매기기"
          >
            1. 목록
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="toolbar-btn"
            title="링크"
          >
            🔗 링크
          </button>
          <button
            type="button"
            onClick={handleImageUpload}
            className="toolbar-btn"
            title="이미지"
          >
            🖼️ 이미지
          </button>
          <button
            type="button"
            onClick={insertHorizontalRule}
            className="toolbar-btn"
            title="가로선"
          >
            ➖ 가로선
          </button>
          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            className="toolbar-btn"
            title="서식 지우기"
          >
            🧹 지우기
          </button>
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="toolbar-btn"
            title={fullscreen ? "전체화면 해제" : "전체화면"}
          >
            {fullscreen ? "⛶ 전체화면 해제" : "⛶ 전체화면"}
          </button>
        </div>
      )}
      
      {/* 에디터 */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(
          'editor-content',
          isFocused && 'focused',
          readOnly && 'readonly',
          fullscreen && 'fullscreen'
        )}
        style={{
          minHeight: fullscreen ? 'calc(100vh - 120px)' : height,
          height: fullscreen ? 'calc(100vh - 120px)' : height
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor; 