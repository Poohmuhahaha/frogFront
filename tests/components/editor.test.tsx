import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import RichTextEditor from '../../src/components/editor/RichTextEditor';

// Mock the rich text editor dependencies
jest.mock('react-quill', () => {
  return React.forwardRef<any, any>(({ value, onChange, placeholder, modules, formats }, ref) => (
    <div data-testid="quill-editor">
      <textarea
        ref={ref}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        data-modules={JSON.stringify(modules)}
        data-formats={JSON.stringify(formats)}
      />
    </div>
  ));
});

jest.mock('quill-image-resize-module', () => ({}));

// Mock SEO utilities
jest.mock('../../src/utils/seo', () => ({
  seoManager: {
    extractMetaFromContent: jest.fn(() => ({
      description: 'Test description extracted from content',
      keywords: ['test', 'content', 'article'],
      readingTime: 5
    })),
    getSEOScore: jest.fn(() => ({
      score: 85,
      suggestions: ['Add more keywords', 'Improve meta description']
    }))
  }
}));

describe('RichTextEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Start writing...'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the editor with placeholder', () => {
    render(<RichTextEditor {...defaultProps} />);

    expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Start writing...')).toBeInTheDocument();
  });

  it('should display the current value', () => {
    const testValue = '<p>Test content</p>';
    render(<RichTextEditor {...defaultProps} value={testValue} />);

    expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
  });

  it('should call onChange when content changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RichTextEditor {...defaultProps} onChange={onChange} />);

    const editor = screen.getByPlaceholderText('Start writing...');
    await user.type(editor, 'New content');

    expect(onChange).toHaveBeenCalled();
  });

  it('should show SEO panel when enabled', () => {
    render(<RichTextEditor {...defaultProps} showSEOPanel={true} />);

    expect(screen.getByText('SEO Analysis')).toBeInTheDocument();
    expect(screen.getByText('Reading Time')).toBeInTheDocument();
    expect(screen.getByText('SEO Score')).toBeInTheDocument();
  });

  it('should update SEO analysis when content changes', async () => {
    const user = userEvent.setup();
    const { seoManager } = require('../../src/utils/seo');

    render(<RichTextEditor {...defaultProps} showSEOPanel={true} />);

    const editor = screen.getByPlaceholderText('Start writing...');
    await user.type(editor, 'This is test content for SEO analysis');

    await waitFor(() => {
      expect(seoManager.extractMetaFromContent).toHaveBeenCalled();
      expect(seoManager.getSEOScore).toHaveBeenCalled();
    });

    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
  });

  it('should display word count when enabled', () => {
    const content = '<p>This is a test content with some words</p>';
    render(<RichTextEditor {...defaultProps} value={content} showWordCount={true} />);

    expect(screen.getByText(/\d+ words/)).toBeInTheDocument();
  });

  it('should handle image upload', async () => {
    const user = userEvent.setup();
    const onImageUpload = jest.fn().mockResolvedValue('https://example.com/image.jpg');

    render(<RichTextEditor {...defaultProps} onImageUpload={onImageUpload} />);

    // Simulate file input for image upload
    const fileInput = screen.getByTestId('image-upload-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    expect(onImageUpload).toHaveBeenCalledWith(file);
  });

  it('should show loading state during image upload', async () => {
    const user = userEvent.setup();
    const onImageUpload = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('https://example.com/image.jpg'), 100))
    );

    render(<RichTextEditor {...defaultProps} onImageUpload={onImageUpload} />);

    const fileInput = screen.getByTestId('image-upload-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });
  });

  it('should handle image upload errors', async () => {
    const user = userEvent.setup();
    const onImageUpload = jest.fn().mockRejectedValue(new Error('Upload failed'));

    render(<RichTextEditor {...defaultProps} onImageUpload={onImageUpload} />);

    const fileInput = screen.getByTestId('image-upload-input');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Image upload failed')).toBeInTheDocument();
    });
  });

  it('should apply custom toolbar configuration', () => {
    const customToolbar = [
      ['bold', 'italic'],
      ['link', 'image'],
      [{ header: [1, 2, 3, false] }]
    ];

    render(<RichTextEditor {...defaultProps} toolbar={customToolbar} />);

    const editor = screen.getByTestId('quill-editor');
    const modules = JSON.parse(editor.getAttribute('data-modules') || '{}');

    expect(modules.toolbar).toEqual(customToolbar);
  });

  it('should handle autosave functionality', async () => {
    const onAutosave = jest.fn();
    const content = '<p>Test content for autosave</p>';

    render(
      <RichTextEditor
        {...defaultProps}
        value={content}
        onAutosave={onAutosave}
        autosaveDelay={1000}
      />
    );

    // Wait for autosave delay
    await waitFor(() => {
      expect(onAutosave).toHaveBeenCalledWith(content);
    }, { timeout: 1500 });
  });

  it('should show character limit when maxLength is set', () => {
    const content = '<p>Test content</p>';
    render(<RichTextEditor {...defaultProps} value={content} maxLength={1000} />);

    expect(screen.getByText(/\d+\/1000 characters/)).toBeInTheDocument();
  });

  it('should prevent typing when character limit is reached', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const shortContent = 'Hi';

    render(
      <RichTextEditor
        {...defaultProps}
        value={shortContent}
        onChange={onChange}
        maxLength={5}
      />
    );

    const editor = screen.getByDisplayValue(shortContent);
    await user.type(editor, 'More text that exceeds limit');

    // Should not call onChange for characters beyond limit
    expect(onChange).not.toHaveBeenCalledWith(expect.stringContaining('More text that exceeds limit'));
  });

  it('should toggle preview mode', async () => {
    const user = userEvent.setup();
    const content = '<p>Test content with <strong>formatting</strong></p>';

    render(<RichTextEditor {...defaultProps} value={content} showPreview={true} />);

    const previewButton = screen.getByText('Preview');
    await user.click(previewButton);

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByTestId('content-preview')).toBeInTheDocument();
  });

  it('should handle full screen mode', async () => {
    const user = userEvent.setup();

    render(<RichTextEditor {...defaultProps} allowFullScreen={true} />);

    const fullScreenButton = screen.getByTitle('Full Screen');
    await user.click(fullScreenButton);

    expect(screen.getByTestId('editor-container')).toHaveClass('fullscreen');
  });

  it('should handle paste events and clean HTML', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RichTextEditor {...defaultProps} onChange={onChange} />);

    const editor = screen.getByPlaceholderText('Start writing...');

    // Simulate paste event with messy HTML
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    pasteEvent.clipboardData?.setData('text/html', '<div style="color: red;"><script>alert("xss")</script>Test content</div>');

    fireEvent.paste(editor, pasteEvent);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.not.stringContaining('<script>'));
    });
  });

  it('should handle keyboard shortcuts', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();

    render(<RichTextEditor {...defaultProps} onSave={onSave} />);

    const editor = screen.getByPlaceholderText('Start writing...');

    // Simulate Ctrl+S shortcut
    await user.type(editor, '{Control>}s{/Control}');

    expect(onSave).toHaveBeenCalled();
  });

  it('should display formatting toolbar buttons', () => {
    render(<RichTextEditor {...defaultProps} />);

    // Check for common formatting buttons
    expect(screen.getByTitle('Bold')).toBeInTheDocument();
    expect(screen.getByTitle('Italic')).toBeInTheDocument();
    expect(screen.getByTitle('Underline')).toBeInTheDocument();
    expect(screen.getByTitle('Insert Link')).toBeInTheDocument();
  });

  it('should handle read-only mode', () => {
    render(<RichTextEditor {...defaultProps} readOnly={true} />);

    const editor = screen.getByTestId('quill-editor');
    expect(editor.querySelector('textarea')).toHaveAttribute('readonly');
  });

  it('should maintain focus state', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    render(<RichTextEditor {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);

    const editor = screen.getByPlaceholderText('Start writing...');

    await user.click(editor);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('should handle emoji picker integration', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RichTextEditor {...defaultProps} onChange={onChange} showEmojiPicker={true} />);

    const emojiButton = screen.getByTitle('Insert Emoji');
    await user.click(emojiButton);

    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();

    const smileyEmoji = screen.getByText('😊');
    await user.click(smileyEmoji);

    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('😊'));
  });

  it('should validate and show error messages', () => {
    const errors = ['Content is required', 'Content must be at least 100 characters'];

    render(<RichTextEditor {...defaultProps} errors={errors} />);

    errors.forEach(error => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it('should support custom themes', () => {
    render(<RichTextEditor {...defaultProps} theme="snow" />);

    const editor = screen.getByTestId('quill-editor');
    expect(editor).toHaveClass('ql-snow');
  });
});