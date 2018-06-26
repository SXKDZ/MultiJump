defmodule Jump.Repo.Migrations.CreateRooms do
  use Ecto.Migration

  def change do
    create table(:rooms) do
      add :key, :string
      add :seed, :integer

      timestamps()
    end

  end
end
