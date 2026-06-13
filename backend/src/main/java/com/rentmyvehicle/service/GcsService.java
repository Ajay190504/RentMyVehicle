package com.rentmyvehicle.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.rentmyvehicle.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class GcsService {

    @Value("${gcs.bucket-name}")
    private String bucketName;

    @Value("${gcs.credentials-path}")
    private String credentialsPath;

    private Storage storage;

    private InputStream getCredentialsStream() {
        try {
            // 0. Try direct environment variable GOOGLE_CREDENTIALS_JSON
            String credsJson = System.getenv("GOOGLE_CREDENTIALS_JSON");
            if (credsJson != null && !credsJson.trim().isEmpty()) {
                System.out.println("GCS credentials found in GOOGLE_CREDENTIALS_JSON env variable.");
                return new java.io.ByteArrayInputStream(credsJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }

            // 1. Try direct file path
            Path directPath = Paths.get(credentialsPath);
            if (Files.exists(directPath)) {
                System.out.println("GCS credentials found at direct path: " + directPath.toAbsolutePath());
                return new FileInputStream(directPath.toFile());
            }

            // 2. Try inside backend subfolder (in case started from root)
            Path backendPath = Paths.get("backend").resolve(credentialsPath);
            if (Files.exists(backendPath)) {
                System.out.println("GCS credentials found at backend path: " + backendPath.toAbsolutePath());
                return new FileInputStream(backendPath.toFile());
            }

            // 3. Try classpath
            InputStream classpathStream = getClass().getClassLoader().getResourceAsStream(credentialsPath);
            if (classpathStream != null) {
                System.out.println("GCS credentials found in classpath: " + credentialsPath);
                return classpathStream;
            }

            // 4. Try parent directory
            Path parentPath = Paths.get("..").resolve(credentialsPath);
            if (Files.exists(parentPath)) {
                System.out.println("GCS credentials found at parent path: " + parentPath.toAbsolutePath());
                return new FileInputStream(parentPath.toFile());
            }
        } catch (Exception e) {
            System.err.println("Error resolving GCS credentials stream: " + e.getMessage());
        }
        return null;
    }

    private synchronized Storage getStorage() {
        if (storage == null) {
            try (InputStream credsStream = getCredentialsStream()) {
                if (credsStream != null) {
                    storage = StorageOptions.newBuilder()
                            .setCredentials(GoogleCredentials.fromStream(credsStream))
                            .build()
                            .getService();
                    System.out.println("GCS Storage client initialized successfully using credentials file.");
                } else {
                    storage = StorageOptions.getDefaultInstance().getService();
                    System.out.println("GCS Storage client initialized using default environment credentials.");
                }
            } catch (Exception e) {
                System.err.println("GCS Initialization failed: " + e.getMessage() + ". Local fallback will be used.");
            }
        }
        return storage;
    }

    public String uploadFile(MultipartFile file) {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Storage storageInstance = getStorage();

        if (storageInstance != null) {
            try {
                BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                        .setContentType(file.getContentType())
                        .build();
                storageInstance.create(blobInfo, file.getBytes());
                System.out.println("Successfully uploaded file to GCS: " + fileName);
                return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
            } catch (Exception e) {
                System.err.println("GCS upload failed: " + e.getMessage() + ". Falling back to local file storage.");
            }
        } else {
            System.err.println("GCS Storage client is null. Falling back to local file storage.");
        }

        // Local mockup fallback: save file inside backend uploads folder
        try {
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path targetPath = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetPath);
            System.out.println("Saved file locally as GCS fallback: " + fileName);
            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new BadRequestException("Failed to save image locally: " + e.getMessage());
        }
    }
}

