<?php

const SAVE_DIR = __DIR__ . '/assets/';
if (!file_exists(SAVE_DIR) && !mkdir(SAVE_DIR, 0777, true)) {
  echo json_encode(['error' => 'Directory not created']);
  exit();
}

$file = $_FILES['file'] ?? [];
header('Content-type: application/json');
if (!$file) {
  header('HTTP/1.0 400 Bad Request');
  echo json_encode(['error' => 'File not found']);
  exit();
}

$filename = $file['name'];
$source = $file['tmp_name'];
$name = explode('.', $filename);
if (strtolower($name[1]) !== 'zip') {
  header('HTTP/1.0 400 Bad Request');
  echo json_encode(['error' => 'The file you are trying to upload is not a .zip file. Please try again.']);
  exit();
}

try {
  $filePath = SAVE_DIR . random_bytes(5) . '_' . $filename;
  $tmpPath = $file['tmp_name'];
  if (move_uploaded_file($tmpPath, $filePath)) {
    $zip = new ZipArchive();
    if ($zip->open($filePath)) {
      $zip->extractTo(SAVE_DIR);
      $zip->close();
      unlink($filePath);
      header('HTTP/1.0 200 OK');
      echo json_encode(['success' => true]);
    } else {
      header('HTTP/1.0 500 Internal Server Error');
      echo json_encode(['error' => 'Failed to open archive']);
    }
    exit();
  }
} catch (Throwable $e) {
  header('HTTP/1.0 500 Internal Server Error');
  echo json_encode(['error' => $e->getMessage()]);
  exit();
}
