class LineItem < ApplicationRecord
  include Elasticsearch::Model
  include Elasticsearch::Model::Callbacks
  belongs_to :campaign

  scope :with_campaign, -> {includes(:campaign)}

  mappings dynamic: false do
    indexes :name, type: :text
    indexes :campaign, type: :object do
      indexes :name
    end
  end

  def as_indexed_json(options={})
    self.as_json(
      only: [:id, :name],
      include: {campaign: {only: [:id, :name]}}
    )
  end
end
