/**
 * Resolves occurrences of {{variableName}} in a string using the provided runtime context.
 */
export function resolveVariables(content: any, variables: Record<string, any>): any {
    if (typeof content !== 'string') return content;

    // Matches {{anythingInside}}
    return content.replace(/\{\{(.*?)\}\}/g, (match, varName) => {
        const trimmed = varName.trim();
        // If variable exists, return its value; otherwise, return an empty string (fallback)
        return variables[trimmed] !== undefined ? String(variables[trimmed]) : '';
    });
}
