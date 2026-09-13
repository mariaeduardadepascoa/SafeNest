package com.safenest;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SafenestApplication {

    public static void main(String[] args) {

        Dotenv dotenv = Dotenv.configure()
                .directory("SafeNest-Dispositivos")
                .load();

        System.out.println("DB HOST: " + dotenv.get("SUPABASE_DB_HOST"));
        System.out.println("DB PORT: " + dotenv.get("SUPABASE_DB_PORT"));
        System.out.println("DB NAME: " + dotenv.get("SUPABASE_DB_NAME"));
        System.out.println("DB USER: " + dotenv.get("SUPABASE_DB_USER"));
        System.out.println("DB PASSWORD: " +
                (dotenv.get("SUPABASE_DB_PASSWORD") != null ? "OK" : "NULL"));

        System.out.println("BROKER HOST: " + dotenv.get("BROKER_HOST"));
        System.out.println("BROKER PORT: " + dotenv.get("BROKER_PORT"));
        System.out.println("BROKER USER: " + dotenv.get("BROKER_USERNAME"));
        System.out.println("BROKER PASSWORD: " +
                (dotenv.get("BROKER_PASSWORD") != null ? "OK" : "NULL"));

        System.out.println("JWT: " +
                (dotenv.get("JWT_SECRET") != null ? "OK" : "NULL"));

        System.setProperty("SUPABASE_DB_HOST", dotenv.get("SUPABASE_DB_HOST"));
        System.setProperty("SUPABASE_DB_PORT", dotenv.get("SUPABASE_DB_PORT"));
        System.setProperty("SUPABASE_DB_NAME", dotenv.get("SUPABASE_DB_NAME"));
        System.setProperty("SUPABASE_DB_USER", dotenv.get("SUPABASE_DB_USER"));
        System.setProperty("SUPABASE_DB_PASSWORD", dotenv.get("SUPABASE_DB_PASSWORD"));

        System.setProperty("broker.host", dotenv.get("BROKER_HOST"));
        System.setProperty("broker.port", dotenv.get("BROKER_PORT"));
        System.setProperty("broker.username", dotenv.get("BROKER_USERNAME"));
        System.setProperty("broker.password", dotenv.get("BROKER_PASSWORD"));

        System.setProperty("jwt.secret", dotenv.get("JWT_SECRET"));

        SpringApplication.run(SafenestApplication.class, args);
    }
}