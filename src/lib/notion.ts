/**
 * Notion API integration for tracking student progress
 * Never throws errors - fails silently to not break the app
 */

export interface LogProgressParams {
  studentName: string;
  studentId: string;
  event: string;
  details: string;
  totalXP: number;
}

export async function logProgress(params: LogProgressParams): Promise<boolean> {
  try {
    const notionToken = process.env.NEXT_PUBLIC_NOTION_TOKEN;
    const databaseId = process.env.NEXT_PUBLIC_NOTION_DATABASE_ID;

    if (!notionToken || !databaseId) {
      console.warn('Notion credentials not configured - skipping log');
      return false;
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          'Name': {
            title: [{ text: { content: params.studentName } }],
          },
          'Student ID': {
            rich_text: [{ text: { content: params.studentId } }],
          },
          'Event': {
            rich_text: [{ text: { content: params.event } }],
          },
          'Details': {
            rich_text: [{ text: { content: params.details } }],
          },
          'Total XP': {
            number: params.totalXP,
          },
          'Date': {
            date: { start: new Date().toISOString() },
          },
        },
      }),
    });

    if (!response.ok) {
      console.warn('Notion API request failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to log to Notion:', error);
    return false;
  }
}
