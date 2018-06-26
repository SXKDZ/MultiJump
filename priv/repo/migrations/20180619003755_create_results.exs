defmodule Jump.Repo.Migrations.CreateResults do
  use Ecto.Migration

  def change do
    create table(:results) do
      add :name, :string
      add :room_key, :string
      add :score, :integer

      timestamps()
    end

  end
end
