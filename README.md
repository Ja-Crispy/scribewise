# ScribeWise - Your AI Writing Assistant

ScribeWise is a modern, AI-powered text editor that helps you improve your writing through intelligent revisions and annotations. Built with React and TypeScript, it offers a clean, intuitive interface with powerful features.

## Live Demo
[ScribeWise Demo](https://scribewise.vercel.app/)

## Features
- AI-powered text revisions with style-specific suggestions
- Smart annotations with highlighting
- Real-time word and character count
- Revision history tracking
- Dark/light mode support
- File import (TXT, MD, DOCX)
- Keyboard shortcuts
- Copy to clipboard functionality
- Accessibility features

## Architecture & Technical Decisions

### Tech Stack
- **React + TypeScript**: For type-safe, component-based UI development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS for rapid UI development
- **shadcn/ui**: High-quality UI components built on Radix UI
- **OpenAI API**: GPT-4 for intelligent text revisions
- **Mammoth.js**: DOCX file processing

### Key Design Decisions
1. **Component Architecture**
   - Modular components for better maintainability
   - Custom hooks for shared logic
   - Error boundaries for graceful error handling

2. **State Management**
   - React's useState and useContext for local and shared state
   - Efficient undo/redo implementation using state history

3. **AI Integration**
   - Asynchronous API calls with loading states
   - Context-aware revisions using surrounding text
   - Style-specific prompts for targeted improvements

4. **Accessibility**
   - ARIA labels and roles
   - Keyboard navigation support
   - High contrast mode compatibility

## Prompt Engineering Documentation

### Writing Style Prompts
ScribeWise uses carefully crafted prompts for different writing styles:

1. **Creative**
   ```
   Be imaginative and expressive. Use vivid language, metaphors, and engaging narrative techniques while maintaining clarity.
   ```

2. **Formal**
   ```
   Maintain a professional and polished tone. Use clear, precise language and formal vocabulary appropriate for business or official contexts.
   ```

3. **Academic**
   ```
   Follow academic writing conventions. Use scholarly language, maintain objectivity, and ensure proper structure and argumentation.
   ```

4. **Casual**
   ```
   Adopt a conversational and relaxed tone while maintaining clarity and coherence. Use natural language and accessible vocabulary.
   ```

5. **Technical**
   ```
   Focus on precision and clarity. Use technical terminology appropriately, maintain a logical structure, and prioritize accuracy.
   ```

### Revision System Prompt
The AI receives context about:
- Selected text
- Surrounding context
- Current writing style
- Existing annotations
- Formatting requirements

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scribewise.git
   cd scribewise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development Timeline

1. **Project Setup & Scaffolding** (30 minutes))
   - Repository setup
   - Dependencies installation
   - Basic component structure

2. **Frontend Development** (1 hour)
   - UI components
   - Responsive design
   - Theme implementation
   - File handling

3. **AI Integration** (30 minutes)
   - OpenAI API integration
   - Prompt engineering
   - Style-specific revisions

4. **Core Features** (2 hours)
   - Text editor functionality
   - Annotations system
   - Revision history
   - Undo/redo

5. **Testing & Refinement** (30 hours)
   - Bug fixes
   - Performance optimization
   - Accessibility improvements

Total Development Time: ~ 4 hours 30 minutes (3:30 P.M to 8:00 P.M IST )

## Future Improvements

1. **Enhanced AI Features**
   - Multiple revision options
   - Style transfer between different writing styles
   - Plagiarism detection
   - Grammar explanation

2. **Collaboration Features**
   - Real-time collaboration
   - Comment threads
   - Version control
   - Share links

3. **Advanced Editor Features**
   - Markdown support
   - Rich text formatting
   - Custom keyboard shortcuts
   - Template system

4. **Integration & Export**
   - Google Docs integration
   - Export to more formats
   - Citation management
   - Bibliography generation

5. **Analytics & Learning**
   - Writing statistics
   - Improvement tracking
   - Personal style analysis
   - Learning recommendations

## License

GNU General Public License v3.0

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](LICENSE) for more details.

## Author

Made with ❤️ by Vaishnav
