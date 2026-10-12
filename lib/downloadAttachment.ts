export async function downloadAttachment(
  fileUrl: string,
  fileName: string
) {
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error(
      "Failed to download attachment."
    );
  }

  const blob = await response.blob();

  const downloadUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(downloadUrl);
}