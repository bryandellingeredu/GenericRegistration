BEGIN TRANSACTION;
GO

ALTER TABLE [RegistrationEvents] ADD [AutoEmail] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240426133426_autoemail', N'8.0.2');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [RegistrationEvents] ADD [RegistrationIsOpen] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240426140507_registrationisopen', N'8.0.2');
GO

UPDATE RegistrationEvents SET RegistrationIsOpen = 1, AutoEmail = 1;
GO

COMMIT;
GO

