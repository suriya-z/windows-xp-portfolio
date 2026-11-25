/** Hands the visitor a file to save, as File > Save As would. */
export const downloadFile = (name: string, data: Blob) => {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
