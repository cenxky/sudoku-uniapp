const API_BASE_URL = "https://sudoku.smallweibo.com"
// const API_BASE_URL = "http://localhost:5000"

export const recognizeImage = (filePath) => {
  return uni.uploadFile({
    url: `${API_BASE_URL}/recognize`,
    name: "file",
    filePath
  })
}
