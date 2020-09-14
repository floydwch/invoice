class CreateExportations < ActiveRecord::Migration[6.0]
  def change
    create_table :exportations do |t|
      t.string :token
      t.string :status

      t.timestamps
    end
    add_index :exportations, :token, unique: true
  end
end
