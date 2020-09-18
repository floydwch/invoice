class AddReviewedToLineItem < ActiveRecord::Migration[6.0]
  def change
    add_column :line_items, :reviewed, :boolean, default: false
  end
end
