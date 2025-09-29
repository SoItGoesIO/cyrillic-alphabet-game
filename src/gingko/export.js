import { GingkoDb } from './db.js';

export class GingkoExporter {
  static async exportTree(treeId, format = 'md') {
    try {
      const tree = await GingkoDb.getTree(treeId);
      const cards = await GingkoDb.getTreeCards(treeId);

      switch (format.toLowerCase()) {
        case 'md':
        case 'markdown':
          return this.exportToMarkdown(tree, cards);
        case 'json':
          return this.exportToJSON(tree, cards);
        case 'docx':
          return this.exportToDocx(tree, cards);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static exportToMarkdown(tree, cards) {
    const structure = GingkoDb.buildTreeStructure(cards);
    let markdown = `# ${tree.title}\n\n`;

    if (tree.description) {
      markdown += `${tree.description}\n\n`;
    }

    const renderLevel = (nodes, depth = 0) => {
      let content = '';

      nodes.forEach(node => {
        // Skip cards marked as hidden from export
        if (node.hidden_from_export) return;

        // Process content and remove hidden sections
        let cardContent = node.content_markdown || '';
        cardContent = this.removeHiddenSections(cardContent);

        if (cardContent.trim()) {
          const headingLevel = '#'.repeat(Math.min(depth + 2, 6));

          // Extract title from content (first line or first heading)
          const lines = cardContent.split('\n');
          let title = '';
          let body = cardContent;

          // Check if first line is a heading
          const firstLine = lines[0]?.trim();
          if (firstLine?.startsWith('#')) {
            title = firstLine.replace(/^#+\s*/, '');
            body = lines.slice(1).join('\n').trim();
          } else if (firstLine) {
            // Use first line as title if it's short enough
            if (firstLine.length <= 80 && !firstLine.includes('\n')) {
              title = firstLine;
              body = lines.slice(1).join('\n').trim();
            }
          }

          if (!title) {
            title = 'Card ' + (depth + 1);
          }

          content += `${headingLevel} ${title}\n\n`;

          if (body) {
            content += `${body}\n\n`;
          }
        }

        // Recursively render children
        if (node.children && node.children.length > 0) {
          content += renderLevel(node.children, depth + 1);
        }
      });

      return content;
    };

    markdown += renderLevel(structure);

    return {
      content: markdown,
      filename: `${this.sanitizeFilename(tree.title)}.md`,
      mimeType: 'text/markdown'
    };
  }

  static exportToJSON(tree, cards) {
    const structure = GingkoDb.buildTreeStructure(cards);

    // Filter out hidden content
    const filterHidden = (nodes) => {
      return nodes
        .filter(node => !node.hidden_from_export)
        .map(node => ({
          id: node.id,
          content: this.removeHiddenSections(node.content_markdown || ''),
          order_index: node.order_index,
          created_at: node.created_at,
          updated_at: node.updated_at,
          children: node.children ? filterHidden(node.children) : []
        }));
    };

    const exportData = {
      tree: {
        id: tree.id,
        title: tree.title,
        description: tree.description,
        created_at: tree.created_at,
        updated_at: tree.updated_at
      },
      structure: filterHidden(structure),
      exported_at: new Date().toISOString(),
      format_version: '1.0'
    };

    return {
      content: JSON.stringify(exportData, null, 2),
      filename: `${this.sanitizeFilename(tree.title)}.json`,
      mimeType: 'application/json'
    };
  }

  static async exportToDocx(tree, cards) {
    // For DOCX export, we'll generate HTML and let the browser handle it
    // In a real implementation, you'd use a library like docx or mammoth
    const structure = GingkoDb.buildTreeStructure(cards);

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${tree.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
    h1 { color: #333; border-bottom: 2px solid #333; }
    h2 { color: #666; margin-top: 30px; }
    h3 { color: #888; margin-top: 20px; }
    h4, h5, h6 { color: #aaa; }
    code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; font-style: italic; }
  </style>
</head>
<body>`;

    html += `<h1>${tree.title}</h1>`;

    if (tree.description) {
      html += `<p><em>${tree.description}</em></p>`;
    }

    const renderLevel = (nodes, depth = 0) => {
      let content = '';

      nodes.forEach(node => {
        // Skip hidden cards
        if (node.hidden_from_export) return;

        let cardContent = node.content_markdown || '';
        cardContent = this.removeHiddenSections(cardContent);

        if (cardContent.trim()) {
          const headingLevel = Math.min(depth + 2, 6);

          // Convert markdown to basic HTML
          const htmlContent = this.markdownToHtml(cardContent);

          // Wrap in appropriate heading if needed
          if (!htmlContent.match(/^<h[1-6]/)) {
            const firstLine = cardContent.split('\n')[0]?.trim();
            const title = firstLine && firstLine.length <= 80 ? firstLine : `Section ${depth + 1}`;
            content += `<h${headingLevel}>${title}</h${headingLevel}>`;
            content += htmlContent;
          } else {
            content += htmlContent;
          }
        }

        // Recursively render children
        if (node.children && node.children.length > 0) {
          content += renderLevel(node.children, depth + 1);
        }
      });

      return content;
    };

    html += renderLevel(structure);
    html += '</body></html>';

    return {
      content: html,
      filename: `${this.sanitizeFilename(tree.title)}.html`,
      mimeType: 'text/html'
    };
  }

  static removeHiddenSections(content) {
    // Remove content between <!-- and -->
    return content.replace(/<!--[\s\S]*?-->/g, '');
  }

  static sanitizeFilename(filename) {
    return filename
      .replace(/[^a-z0-9\s\-_.]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 50);
  }

  static markdownToHtml(markdown) {
    return markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')

      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

      // Code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>')

      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')

      // Wrap in paragraphs
      .replace(/^(.+)/, '<p>$1')
      .replace(/(.+)$/, '$1</p>');
  }

  static downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  static async export(treeId, format) {
    try {
      const exportData = await this.exportTree(treeId, format);
      this.downloadFile(exportData.content, exportData.filename, exportData.mimeType);
      return exportData;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}