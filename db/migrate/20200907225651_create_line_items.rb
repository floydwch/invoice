class CreateLineItems < ActiveRecord::Migration[6.0]
  def change
    create_table :line_items do |t|
      t.string :name
      t.decimal :booked_amount, precision: 63, scale: 30
      t.decimal :actual_amount, precision: 63, scale: 30
      t.decimal :adjustments, precision: 63, scale: 30
      t.references :campaign, null: false, foreign_key: true

      t.timestamps
    end
  end
end
